export default {
  server: { port: 5173 },
  define: {
    'process.env': {}
  },
  resolve: {
  dedupe: ["react", "react-dom"],
}

};
