"use client";

import { motion } from "framer-motion";
import { NEU_SURFACE_INSET, NEU_SKELETON, NEU_LABEL } from "@/styles/neu.styles";

const COL_HEADERS = [
  "", "Title", "Type", "Division", "Difficulty",
  "Price", "Ratings", "Wishlist", "Views", "Published",
];

const TourTableSkeleton: React.FC = () => {
  return (
    <div className="overflow-auto rounded-2xl">
      <table className="w-full border-collapse">
        {/* Header */}
        <thead>
          <tr
            className={`${NEU_SURFACE_INSET} rounded-xl`}
          >
            {COL_HEADERS.map((h, i) => (
              <th
                key={i}
                className={`
                  px-4 py-3 text-left
                  ${NEU_LABEL}
                  first:rounded-tl-xl last:rounded-tr-xl
                `}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {[...Array(5)].map((_, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.07, duration: 0.3 }}
              className="border-b border-[#1E2938]/5 last:border-0"
            >
              {/* Expand toggle */}
              <td className="px-4 py-3 w-12">
                <div className={`h-8 w-8 rounded-xl ${NEU_SKELETON}`} />
              </td>

              {/* Title */}
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <div className={`h-4 w-44 rounded ${NEU_SKELETON}`} />
                  <div className={`h-3 w-28 rounded ${NEU_SKELETON}`} />
                </div>
              </td>

              {/* Type */}
              <td className="px-4 py-3">
                <div className={`h-6 w-20 rounded-lg ${NEU_SKELETON}`} />
              </td>

              {/* Division */}
              <td className="px-4 py-3">
                <div className={`h-4 w-24 rounded ${NEU_SKELETON}`} />
              </td>

              {/* Difficulty */}
              <td className="px-4 py-3">
                <div className={`h-6 w-16 rounded-lg ${NEU_SKELETON}`} />
              </td>

              {/* Price */}
              <td className="px-4 py-3">
                <div className={`h-4 w-16 rounded ${NEU_SKELETON}`} />
              </td>

              {/* Ratings */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-10 rounded ${NEU_SKELETON}`} />
                  <div className={`h-3 w-8 rounded ${NEU_SKELETON}`} />
                </div>
              </td>

              {/* Wishlist */}
              <td className="px-4 py-3">
                <div className={`h-4 w-8 rounded ${NEU_SKELETON}`} />
              </td>

              {/* Views */}
              <td className="px-4 py-3">
                <div className={`h-4 w-8 rounded ${NEU_SKELETON}`} />
              </td>

              {/* Published */}
              <td className="px-4 py-3">
                <div className={`h-4 w-24 rounded ${NEU_SKELETON}`} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TourTableSkeleton;