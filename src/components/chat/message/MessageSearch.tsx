import { motion } from "framer-motion";

interface MessageSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const MessageSearch = ({ searchQuery, setSearchQuery }: MessageSearchProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-0 left-0 right-0 z-10 p-2 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700"
    >
      <div className="flex justify-between items-center gap-2">
        <input
          type="search"
          placeholder="Search messages..."
          className="w-full px-3 py-2 rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </motion.div>
  );
};