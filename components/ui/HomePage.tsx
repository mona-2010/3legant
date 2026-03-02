import {Header, NavigationHeader, TitleGrid} from "../dynamicComponents"
import Banner from "../layout/Banner"
import BannerGrid from "../layout/BannerGrid"
import Blog from "../layout/Blog"
import Footer from "../layout/Footer"
import Newsletter from "../layout/NewsLetter"
import ProductCarousel from "../layout/ProductCarousel"
import ImageSlider from "../layout/slider"
import Values from "../layout/Values"

const HomePage = () => {
  return (
    <div>
        <NavigationHeader/>
        <Header/>
        <ImageSlider/>
        <TitleGrid/>
        <BannerGrid/>
        <ProductCarousel/>
        <Values/>
        <Banner/>
        <Blog/>
        <Newsletter/>
        <Footer/>
        
    </div>
  )
}

export default HomePage