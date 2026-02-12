# Terraform Infrastructure as Code

Azure infrastructure provisioning for the Stablecoin Monitoring Platform.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 1.0
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- Azure subscription

## Setup

### 1. Azure Authentication

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "<subscription-id>"
```

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Configure Variables

Create `terraform.tfvars`:

```hcl
project_name = "stablecoin-monitor"
environment  = "dev"
location     = "eastus"

# Database
database_sku = "B_Standard_B1ms"  # Dev: B_Standard_B1ms, Prod: GP_Standard_D2s_v3

# Redis
redis_sku      = "Basic"           # Basic, Standard, Premium
redis_capacity = 0                 # 0-6 depending on SKU
```

## Usage

### Plan

```bash
# Review changes
terraform plan
```

### Apply

```bash
# Apply infrastructure changes
terraform apply

# Auto-approve
terraform apply -auto-approve
```

### Destroy

```bash
# Destroy all resources
terraform destroy
```

## Resources Provisioned

### Azure Resources

1. **Resource Group** - Container for all resources
2. **PostgreSQL Flexible Server** - Database server
   - Version: PostgreSQL 15
   - Storage: 32GB
   - Backup: 7-day retention
3. **PostgreSQL Database** - Application database
4. **Azure Cache for Redis** - Caching layer
   - TLS 1.2 enabled
   - Non-SSL port disabled

## Outputs

After applying, Terraform outputs:

- `resource_group_name` - Resource group name
- `postgres_fqdn` - PostgreSQL server FQDN
- `postgres_connection_string` - Database connection string (sensitive)
- `redis_hostname` - Redis hostname
- `redis_ssl_port` - Redis SSL port

View outputs:

```bash
terraform output
terraform output -json
```

## Cost Estimates

### Development (Basic tier)
- PostgreSQL B_Standard_B1ms: ~$15/month
- Redis Basic C0: ~$16/month
- **Total: ~$31/month**

### Production (Standard/GP tier)
- PostgreSQL GP_Standard_D2s_v3: ~$130/month
- Redis Standard C1: ~$75/month
- **Total: ~$205/month**

## State Management

### Local State (Default)

State file stored locally in `terraform.tfstate`.

### Remote State (Recommended)

Configure Azure Storage backend:

```bash
# Create storage account for state
az group create --name stablecoin-tfstate-rg --location eastus
az storage account create --name stablecointf --resource-group stablecoin-tfstate-rg --sku Standard_LRS
az storage container create --name tfstate --account-name stablecointf
```

Update `main.tf`:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "stablecoin-tfstate-rg"
    storage_account_name = "stablecointf"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}
```

## Environments

### Multiple Environments

Use workspaces or separate state files:

```bash
# Using workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch workspace
terraform workspace select dev
```

### Separate Directories

```
terraform/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
```

## Security

### Secrets Management

Use Azure Key Vault for sensitive values:

```bash
# Store database password
az keyvault secret set --vault-name "stablecoin-kv" --name "postgres-password" --value "<password>"
```

### Network Security

Add firewall rules in `resources.tf`:

```hcl
resource "azurerm_postgresql_flexible_server_firewall_rule" "main" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
```

## Troubleshooting

### State Lock

```bash
# Force unlock if needed
terraform force-unlock <lock-id>
```

### Import Existing Resources

```bash
terraform import azurerm_resource_group.main /subscriptions/<sub-id>/resourceGroups/<rg-name>
```

## Next Steps

1. Configure networking (VNet, NSG)
2. Add App Service / Container Apps
3. Set up monitoring with Application Insights
4. Configure CI/CD pipeline
