# Production Deployment Guide

This guide walks you through deploying your Preschool LMS application to the Internet Computer mainnet.

## Prerequisites

Before deploying to production, ensure you have:

1. **DFINITY SDK (dfx)** installed and updated to the latest version:
   ```bash
   dfx --version
   # If outdated, update with:
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Cycles** for deployment:
   - You need ICP tokens converted to cycles to deploy canisters
   - Get cycles from the [NNS Dapp](https://nns.ic0.app/) or a cycles faucet
   - Minimum recommended: ~2-3 TC (trillion cycles) for initial deployment

3. **Internet Identity** for admin access:
   - Create an Internet Identity at https://identity.ic0.app/
   - You'll use this to log in as the first admin

4. **Project built and tested locally**:
   ```bash
   dfx start --clean
   dfx deploy
   # Test the application thoroughly at http://localhost:4943
   ```

## Step 1: Configure for Mainnet

1. **Create or verify `dfx.json` network configuration**:
   Your `dfx.json` should already include the IC network. Verify it contains:
   ```json
   {
     "networks": {
       "ic": {
         "providers": ["https://ic0.app"],
         "type": "persistent"
       }
     }
   }
   ```

2. **Set up your identity** (if not already done):
   ```bash
   # Create a new identity for production (recommended)
   dfx identity new production
   dfx identity use production
   
   # Check your principal (you'll need this)
   dfx identity get-principal
   ```

3. **Add cycles to your identity**:
   - Transfer ICP to your identity's account address
   - Convert ICP to cycles via NNS Dapp

## Step 2: Deploy to Mainnet

1. **Generate a secure admin token**:
   ```bash
   # Generate a random token (save this securely!)
   export CAFFEINE_ADMIN_TOKEN=$(openssl rand -hex 32)
   echo "Your admin token: $CAFFEINE_ADMIN_TOKEN"
   # IMPORTANT: Save this token - you'll need it to access admin features
   ```

2. **Deploy the backend canister**:
   ```bash
   dfx deploy backend --network ic
   ```
   
   This will:
   - Create the backend canister on mainnet
   - Upload and install the Motoko code
   - Return the canister ID (save this!)

3. **Deploy the frontend canister**:
   ```bash
   dfx deploy frontend --network ic
   ```

4. **Note your canister IDs**:
   ```bash
   dfx canister id backend --network ic
   dfx canister id frontend --network ic
   ```

## Step 3: Access Your Deployed Application

1. **Get your frontend URL**:
   ```bash
   echo "https://$(dfx canister id frontend --network ic).ic0.app"
   ```
   
   Or use the raw URL:
   ```bash
   echo "https://$(dfx canister id frontend --network ic).raw.ic0.app"
   ```

2. **Bootstrap the first admin**:
   - Open your frontend URL in a browser
   - Append the admin token as a URL parameter:
     ```
     https://YOUR_CANISTER_ID.ic0.app/#caffeineAdminToken=YOUR_TOKEN_HERE
     ```
   - Click "Login" and authenticate with your Internet Identity
   - You are now the admin!

3. **Verify admin access**:
   - After logging in with the token, you should see the Admin Panel tab
   - The token is only needed for the first login
   - Subsequent logins will remember your admin role

## Step 4: Post-Deployment Verification

### Test Persistence
1. Create a test form in the Admin Panel
2. Add some test data
3. Refresh the page - data should persist
4. Check import status is saved correctly

### Test Excel Import/Export
1. Go to Excel Manager tab
2. Download a template for a form
3. Fill in a few rows of test data
4. Upload the file and verify:
   - Validation works correctly
   - Valid rows import successfully
   - Import status is recorded
5. Export the data and verify the Excel file opens correctly

### Test Authorization
1. Open the app in an incognito window
2. Try to access without logging in - should show login page
3. Log in with a different Internet Identity
4. Verify they have user (not admin) access
5. Verify they cannot access admin-only features

## Step 5: Configure Custom Domain (Optional)

To use a custom domain:

1. **Set up DNS**:
   - Add a CNAME record pointing to `icp1.io`
   - Or use the boundary node service

2. **Register the domain with your canister**:
   ```bash
   dfx canister call frontend http_request '(record {
     url = "/";
     method = "GET";
     headers = vec {};
     body = vec {};
   })' --network ic
   ```

3. **Follow the Internet Computer custom domain guide**:
   https://internetcomputer.org/docs/current/developer-docs/production/custom-domain/

## Maintenance & Updates

### Upgrading Your Canister

When you need to deploy updates:

