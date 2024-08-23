# Verified contracts on sepolia

- Staking contract -> https://sepolia.etherscan.io/address/0x0ac9be9a27551ca471d71c1cc3cf0a89f6876243#code

- StakingToken contract -> https://sepolia.etherscan.io/address/0x88ec70e2743405f414530187c6597d0b111262e7

# Installation

1. Clone the repository

```bash
git clone https://github.com/milosdjurica/mvp-staking
cd mvp-staking
```

2. Install dependencies

```bash
npm install
```

3. Create .env

```
PRIVATE_KEY="PRIVATE KEY HERE"
SEPOLIA_RPC_URL="YOUR SEPOLIA RPC URL"
ETHERSCAN_API_KEY="For verifying contracts"
```

# Deploying contract

1. Run command

```bash
npx hardhat deploy --network sepolia
```

# Tests & Coverage

## Testing

1. Run tests

```sh
npx hardhat test
```

## Coverage

1. See coverage

```sh
npx hardhat coverage
```

