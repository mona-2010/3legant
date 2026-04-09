import Stripe from "npm:stripe@14.25.0"
import { createClient } from "npm:@supabase/supabase-js@2.42.0"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2026-02-25.clover" as any, 
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  const { method } = req
  
  if (method === "GET") {
    console.log("[Webhook] Health check: Received GET request.")
    return new Response(JSON.stringify({ status: "ok", message: "Stripe Webhook Handler is live" }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  const signature = req.headers.get("stripe-signature")

  console.log(`[Webhook] Incoming request from Stripe. Signature: ${signature ? "Present" : "Missing"}`)

  if (!signature) {
    console.error(`[Webhook] Missing stripe-signature header.`)
    return new Response("Missing stripe-signature", { status: 400 })
  }

  const body = await req.text()
  console.log(`[Webhook] Request body received. Length: ${body.length} characters.`)

  let event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    console.log(`[Webhook] Event verified: ${event.id} (Type: ${event.type})`)
  } catch (err) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  console.log(`[Webhook] Processing event ${event.id} of type ${event.type}`)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        console.log(`[Webhook] Calling handleCheckoutSessionCompleted for Session: ${session.id}`)
        await handleCheckoutSessionCompleted(session)
        break
      }
      case "checkout.session.expired": {
        const session = event.data.object
        console.log(`[Webhook] Calling handleCheckoutSessionExpired for Session: ${session.id}`)
        await handleCheckoutSessionExpired(session)
        break
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object
        await handlePaymentIntentSucceeded(paymentIntent)
        break
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object
        await handlePaymentIntentFailed(paymentIntent)
        break
      }
      case "payment_intent.canceled": {
        const paymentIntent = event.data.object
        await handlePaymentIntentCanceled(paymentIntent)
        break
      }
      case "charge.refunded": {
        const charge = event.data.object
        console.log(`[Webhook] Handling charge.refunded for PI: ${charge.payment_intent}`)
        await handleChargeRefunded(charge)
        break
      }
      default:
        console.log(`[Webhook] Unhandled event type ${event.type}`)
    }
  } catch (err) {
    console.error(`[Webhook] CRITICAL ERROR processing event ${event.type}: ${err.message}`)
    return new Response(`Error: ${err.message}`, { status: 500 })
  }

  console.log(`[Webhook] Event ${event.id} processed successfully.`)

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  })
})

async function handleCheckoutSessionCompleted(session: any) {
  console.log(`[Webhook] Starting handleCheckoutSessionCompleted for: ${session.id}`)
  
  if (session.payment_status !== "paid") {
    console.warn(`[Webhook] Session ${session.id} payment_status is '${session.payment_status}'. Expected 'paid'. Skipping.`)
    return
  }

  const metadata = session.metadata
  if (!metadata) {
    console.error(`[Webhook] No metadata found in session ${session.id}. Aborting.`)
    return
  }

  const piId = session.payment_intent as string
  console.log(`[Webhook] Payment Intent ID: ${piId}`)

  // 1. Check if we already have an Order ID in metadata (Modern Flow)
  const orderIdFromMetadata = metadata.orderId
  let orderId = orderIdFromMetadata

  if (orderIdFromMetadata) {
    console.log(`[Webhook] Found orderId in metadata: ${orderIdFromMetadata}. Looking up in DB...`)
    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderIdFromMetadata)
      .maybeSingle()

    if (fetchError) {
        console.error(`[Webhook] Error fetching order ${orderIdFromMetadata}: ${fetchError.message}`)
    }

    if (existingOrder) {
      console.log(`[Webhook] Found existing Order ${orderIdFromMetadata} with status '${existingOrder.status}'`)
      
      if (existingOrder.status !== "pending" && existingOrder.status !== "processing") {
        console.log(`[Webhook] Order ${orderIdFromMetadata} already handled (Status: ${existingOrder.status}). Done.`)
        return
      }

      console.log(`[Webhook] Updating Order ${orderIdFromMetadata} to 'processing'...`)
      const { error: updateError } = await supabase
        .from("orders")
        .update({ 
          status: "processing", 
          payment_intent_id: piId,
          updated_at: new Date().toISOString() 
        })
        .eq("id", orderIdFromMetadata)
      
      if (updateError) {
        console.error(`[Webhook] Failed to update order status: ${updateError.message}`)
      } else {
        console.log(`[Webhook] Order ${orderIdFromMetadata} status successfully set to 'processing'.`)
      }
    } else {
      console.warn(`[Webhook] Order ID ${orderIdFromMetadata} not found in database. Falling back to manual creation.`)
      orderId = null
    }
  }

  // 2. Fallback: Check for order by payment_intent_id if metadata link failed or was missing
  if (!orderId) {
    console.log(`[Webhook] Searching for order by Payment Intent ID: ${piId}`)
    const { data: orderById } = await supabase
      .from("orders")
      .select("id")
      .eq("payment_intent_id", piId)
      .maybeSingle()
    
    if (orderById) {
      console.log(`[Webhook] Found order by PI fallback. ID: ${orderById.id}`)
      orderId = orderById.id
    }
  }

  // If we found the order (either via metadata or PI), just create the payment record and exit
  if (orderId) {
    console.log(`[Webhook] Finalizing existing Order ${orderId}...`)
    await createPaymentRecord(orderId, metadata, piId)
    return
  }

  // 3. Last Resort: Create everything from scratch (Legacy or missing record)
  console.log(`[Webhook] No existing order found. Creating entire order from session metadata.`)
  let userInfo, items
  try {
    console.log(`[Webhook] Parsing session metadata...`)
    userInfo = JSON.parse(metadata.userInfo || "{}")
    items = JSON.parse(metadata.items || "[]")
    console.log(`[Webhook] Metadata parsed successfully. Items count: ${items.length}`)
  } catch (parseErr: any) {
    console.error(`[Webhook] ERROR parsing metadata: ${parseErr.message}`)
    return
  }

  // A. Reserve Stock
  const { reservedItems, error: stockError } = await reserveStock(items)
  if (stockError) {
    console.error(`[Webhook] Stock reservation failed: ${stockError}`)
    return
  }

  // B. Create Order
  console.log(`[Webhook] Inserting NEW order into database...`)
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: metadata.userId || "guest",
      first_name: userInfo.first_name,
      last_name: userInfo.last_name,
      email: userInfo.email,
      phone: userInfo.phone || null,
      street_address: userInfo.shipping.street_address,
      country: userInfo.shipping.country,
      town_city: userInfo.shipping.city,
      state: userInfo.shipping.state || null,
      zip_code: userInfo.shipping.zip_code || null,
      status: "processing",
      user_info: userInfo,
      payment_method: "card",
      payment_intent_id: piId,
      shipping_method: metadata.shippingMethod,
      subtotal: parseFloat(metadata.subtotal),
      shipping_cost: parseFloat(metadata.shippingCost),
      discount: parseFloat(metadata.discount),
      total_price: parseFloat(metadata.total),
      coupon_id: metadata.couponId || null,
    })
    .select()
    .single()

  if (orderError) {
    console.error(`[Webhook] New order creation failed: ${orderError.message}`)
    await releaseStock(reservedItems)
    return
  }
  
  console.log(`[Webhook] Successfully created NEW Order: ${order.id}`)
  orderId = order.id

  // C. Create Order Items
  console.log(`[Webhook] Inserting items for Order ${orderId}...`)
  const orderItems = items.map((item: any) => ({
    order_id: orderId,
    product_id: item.id,
    quantity: item.quantity,
    product_price: item.price,
    product_title: item.name,
    product_image: item.image,
    product_color: item.color,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
  if (itemsError) {
    console.error(`[Webhook] Order items insertion failed for Order ${orderId}: ${itemsError.message}`)
  } else {
    console.log(`[Webhook] Inserted ${orderItems.length} items for Order ${orderId}.`)
  }

  // D. Create Payment Record
  await createPaymentRecord(orderId, metadata, piId)

  // E. Clear Cart
  if (metadata.userId) {
    console.log(`[Webhook] Clearing cart for user: ${metadata.userId}`)
    const { data: userCart } = await supabase
      .from("cart")
      .select("id")
      .eq("user_id", metadata.userId)
      .maybeSingle()

    if (userCart) {
      await supabase.from("cart_items").delete().eq("cart_id", userCart.id)
    }
  }

  console.log(`[Webhook] Order ${orderId} successfully processed from scratch.`)
}

async function createPaymentRecord(orderId: string, metadata: any, piId: string) {
  console.log(`[Webhook] Creating payment record for Order ${orderId}...`)
  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: "succeeded",
      stripe_payment_intent_id: piId,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)
    .eq("status", "pending")

  if (paymentError) {
    console.error(`[Webhook] Payment record creation/update failed: ${paymentError.message}`)
  } else {
    console.log(`[Webhook] Payment record updated successfully.`)
  }
}

async function handleCheckoutSessionExpired(session: any) {
  const metadata = session.metadata
  if (!metadata || !metadata.orderId) {
    console.log(`[Webhook] No orderId found in expired session ${session.id}.`)
    return
  }

  const orderId = metadata.orderId
  console.log(`[Webhook] Session expired. Cancelling Order: ${orderId}`)

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle()

  if (order && order.status === "pending") {
    console.log(`[Webhook] Setting Order ${orderId} status to 'cancelled'...`)
    await supabase
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", orderId)
    
    // Also cancel the linked payment record
    await supabase
      .from("payments")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .eq("status", "pending")
    
    await restockOrder(orderId)
    console.log(`[Webhook] Order ${orderId} cancelled and stock restored.`)
  } else {
    console.log(`[Webhook] Order ${orderId} status is ${order?.status || 'unknown'}. Skipping cancellation.`)
  }
}

async function handlePaymentIntentSucceeded(pi: any) {
  const piId = pi.id
  const now = new Date().toISOString()
  console.log(`[Webhook] PI Succeeded: ${piId}. Updating records...`)

  // Update payment record
  const { data: payment, error: pError } = await supabase
    .from("payments")
    .update({
      status: "succeeded",
      processed_at: now,
      updated_at: now,
    })
    .eq("stripe_payment_intent_id", piId)
    .select()
    .maybeSingle()

  if (pError) console.error(`[Webhook] Failed to update payment Record: ${pError.message}`)

  if (payment) {
    console.log(`[Webhook] Payment updated for Order ${payment.order_id}. Setting order to 'processing'...`)
    const { error: oError } = await supabase
      .from("orders")
      .update({
        status: "processing",
        updated_at: now,
      })
      .eq("id", payment.order_id)
      .eq("status", "pending")
    
    if (oError) console.error(`[Webhook] Order update failed for ${payment.order_id}: ${oError.message}`)
  }
}

async function handlePaymentIntentFailed(pi: any) {
  const piId = pi.id
  const now = new Date().toISOString()
  console.log(`[Webhook] PI Failed: ${piId}`)

  const { data: payment, error: pError } = await supabase
    .from("payments")
    .update({ status: "failed", updated_at: now })
    .eq("stripe_payment_intent_id", piId)
    .select()
    .maybeSingle()

  if (pError) console.error(`[Webhook] Payment update failed: ${pError.message}`)

  if (payment) {
    console.log(`[Webhook] Cancelling Order ${payment.order_id} due to PI failure...`)
    await supabase
      .from("orders")
      .update({ status: "cancelled", updated_at: now })
      .eq("id", payment.order_id)
      .eq("status", "pending")
    
    await restockOrder(payment.order_id)
  }
}

async function handlePaymentIntentCanceled(pi: any) {
  const piId = pi.id
  const now = new Date().toISOString()
  console.log(`[Webhook] PI Canceled: ${piId}`)

  const { data: payment, error: pError } = await supabase
    .from("payments")
    .update({ status: "cancelled", updated_at: now })
    .eq("stripe_payment_intent_id", piId)
    .select()
    .maybeSingle()

  if (pError) console.error(`[Webhook] Payment update failed: ${pError.message}`)

  if (payment) {
    console.log(`[Webhook] Cancelling Order ${payment.order_id} due to PI cancellation...`)
    await supabase
      .from("orders")
      .update({ status: "cancelled", updated_at: now })
      .eq("id", payment.order_id)
      .eq("status", "pending")
    
    await restockOrder(payment.order_id)
  }
}

async function handleChargeRefunded(charge: any) {
  if (!charge.payment_intent) return
  const piId = charge.payment_intent
  const now = new Date().toISOString()
  console.log(`[Webhook] Processing refund for PI: ${piId}`)

  const { data: payment, error: pError } = await supabase
    .from("payments")
    .update({ status: "refunded", updated_at: now })
    .eq("stripe_payment_intent_id", piId)
    .select()
    .maybeSingle()

  if (pError) console.error(`[Webhook] Payment update failed: ${pError.message || "Unknown error"}`)

  if (payment) {
    console.log(`[Webhook] Setting Order ${payment.order_id} to 'refunded'...`)
    const { error: oError } = await supabase
      .from("orders")
      .update({ status: "refunded", updated_at: now })
      .eq("id", payment.order_id)
    
    if (oError) console.error(`[Webhook] Order update failed: ${oError.message}`)
    
    await restockOrder(payment.order_id)
  }
}

// --- Helper Functions Ported from Next.js actions ---

async function reserveStock(items: any[]) {
  console.log(`[Stock] Attempting to reserve stock for ${items.length} items.`)
  const reservedItems: any[] = []
  for (const item of items) {
    const productId = item.id
    const quantity = item.quantity

    const { data: product } = await supabase
      .from("products")
      .select("stock, title")
      .eq("id", productId)
      .single()

    if (!product || (product.stock || 0) < quantity) {
      console.warn(`[Stock] Insufficient stock for ${product?.title || productId}. Needed: ${quantity}`)
      return { reservedItems, error: `Insufficient stock for ${product?.title || productId}` }
    }

    const nextStock = (product.stock || 0) - quantity
    console.log(`[Stock] Reserving ${quantity} of '${product.title}'.`)
    const { error: updateError } = await supabase
      .from("products")
      .update({ 
        stock: nextStock, 
        is_active: nextStock > 0,
        updated_at: new Date().toISOString() 
      })
      .eq("id", productId)
      .gte("stock", quantity)

    if (updateError) {
      console.error(`[Stock] Failed to reserve stock: ${updateError.message}`)
      return { reservedItems, error: updateError.message }
    }
    reservedItems.push({ product_id: productId, quantity })
  }
  console.log(`[Stock] All items successfully reserved.`)
  return { reservedItems, error: null }
}

async function releaseStock(items: any[]) {
  console.log(`[Stock] Releasing stock for ${items.length} items.`)
  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock, title")
      .eq("id", item.product_id)
      .single()

    if (product) {
      console.log(`[Stock] Restoring ${item.quantity} to '${product.title}'`)
      await supabase
        .from("products")
        .update({ stock: (product.stock || 0) + item.quantity, is_active: true, updated_at: new Date().toISOString() })
        .eq("id", item.product_id)
    }
  }
}

async function restockOrder(orderId: string) {
  console.log(`[Restock] START: Restoring items for Order: ${orderId}`)
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId)

  if (itemsError) {
    console.error(`[Restock] Failed to fetch order items: ${itemsError.message}`)
    return
  }

  if (items && items.length > 0) {
    console.log(`[Restock] Found ${items.length} items to release back to stock.`)
    await releaseStock(items)
  } else {
    console.log(`[Restock] No items found for order ${orderId}.`)
  }

  // Restore coupon use if any
  const { data: order } = await supabase
    .from("orders")
    .select("coupon_id")
    .eq("id", orderId)
    .single()

  if (order?.coupon_id) {
    console.log(`[Restock] Restoring coupon: ${order.coupon_id}`)
    const { data: coupon } = await supabase
      .from("coupons")
      .select("current_uses")
      .eq("id", order.coupon_id)
      .single()
    
    if (coupon) {
      await supabase
        .from("coupons")
        .update({ 
          current_uses: Math.max(0, (coupon.current_uses || 0) - 1), 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", order.coupon_id)
    }
  }
}
