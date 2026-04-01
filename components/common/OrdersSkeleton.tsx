import React from "react";

export default function OrdersSkeleton() {
  return (
    <div className="overflow-x-auto animate-pulse">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-lightgray text-sm text-gray-400">
            <th className="text-left py-4 w-32"><div className="h-4 w-20 bg-gray-100 rounded mx-auto" /></th>
            <th className="text-left py-4 w-32"><div className="h-4 w-20 bg-gray-100 rounded mx-auto" /></th>
            <th className="text-left py-4 w-32"><div className="h-4 w-20 bg-gray-100 rounded mx-auto" /></th>
            <th className="text-left py-4 w-32"><div className="h-4 w-20 bg-gray-100 rounded mx-auto" /></th>
            <th className="text-left py-4 w-32"><div className="h-4 w-20 bg-gray-100 rounded mx-auto" /></th>
            <th className="text-left py-4 w-12"><div className="h-4 w-8 bg-gray-100 rounded mx-auto" /></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(4)].map((_, i) => (
            <tr key={i} className="border-b border-lightgray">
              <td className="py-4"><div className="h-4 w-16 bg-gray-200 rounded mx-auto" /></td>
              <td className="py-4"><div className="h-4 w-16 bg-gray-100 rounded mx-auto" /></td>
              <td className="py-4"><div className="h-4 w-16 bg-gray-100 rounded mx-auto" /></td>
              <td className="py-4"><div className="h-4 w-16 bg-gray-100 rounded mx-auto" /></td>
              <td className="py-4"><div className="h-4 w-16 bg-gray-100 rounded mx-auto" /></td>
              <td className="py-4"><div className="h-4 w-8 bg-gray-200 rounded mx-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
