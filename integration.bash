# Delete the node module folder
rm -fr node_modules

# Install the node modules
npm ci

# Build
npm run build

# Copy to /var/wwww/html the build folder
sudo cp -r build/* /var/www/html

# Restart nginx
sudo systemctl restart nginx

# Restart the pm2 process
pm2 restart all
