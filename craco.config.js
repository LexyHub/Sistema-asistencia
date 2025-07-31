module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix for production build compatibility
      if (webpackConfig.mode === 'production') {
        // Disable source maps for production to avoid Vercel deployment issues
        webpackConfig.devtool = false;
      }
      
      return webpackConfig;
    },
  },
  devServer: {
    port: 3000,
    open: false,
    hot: true,
    historyApiFallback: true,
  },
};
