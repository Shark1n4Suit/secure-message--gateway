# Quick Demo Script for Secure Mesh CLI

# 1. Start with system info
echo '=== System Information ==='
node src/index.js info

echo -e '\n=== Creating Network Nodes ==='
# 2. Create some nodes
node src/index.js node create gateway-01 --type gateway
node src/index.js node create client-01 --type standard  
node src/index.js node create client-02 --type standard

echo -e '\n=== Listing Nodes ==='
# 3. List nodes
node src/index.js node list --verbose

echo -e '\n=== Connecting Nodes ==='
# 4. Connect nodes
node src/index.js node connect gateway-01 client-01
node src/index.js node connect gateway-01 client-02

echo -e '\n=== Network Topology ==='
# 5. Show topology
node src/index.js network topology

echo -e '\n=== Network Statistics ==='
# 6. Show stats
node src/index.js network stats

echo -e '\n=== Security Status ==='
# 7. Check security
node src/index.js security status

echo -e '\n=== Send Test Message ==='
# 8. Send a message
node src/index.js message send gateway-01 client-01 'Hello from the mesh network!'

echo -e '\n=== Demo Complete! ==='

