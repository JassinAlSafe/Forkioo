import { PrismaClient } from "@prisma/client";
import { defaultPermissions } from "../lib/rbac";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ==============================================
  // 1. CREATE DEMO COMPANY
  // ==============================================
  console.log("📦 Creating demo company...");

  const company = await prisma.company.upsert({
    where: { id: "demo-company-id" },
    update: {},
    create: {
      id: "demo-company-id",
      name: "Acme Corporation",
      businessType: "llc",
      currency: "USD",
      fiscalYearEnd: "12-31",
      countryCode: "US",
      taxId: "12-3456789",
      settings: {
        // Invoice settings
        invoicePrefix: "INV-",
        invoiceNumberStart: 1000,
        defaultPaymentTermsDays: 30,
        defaultTaxRate: 10,
        taxLabel: "Sales Tax",

        // Branding
        primaryColor: "#3b82f6",
        accentColor: "#10b981",

        // Invoice template
        invoiceFooter: "Thank you for your business!",
        invoiceTerms: "Payment due within 30 days. Late payments subject to 1.5% monthly interest.",

        // Email
        emailFromName: "Acme Corporation",
        emailReplyTo: "billing@acme.com",
      },
    },
  });

  console.log(`✅ Created company: ${company.name}\n`);

  // ==============================================
  // 2. CREATE CHART OF ACCOUNTS
  // ==============================================
  console.log("📊 Creating chart of accounts...");

  const accountsData = [
    // ASSETS (1000-1999)
    {
      code: "1000",
      name: "Cash",
      type: "asset",
      subType: "current_asset",
      isBankAccount: true,
      isSystem: true,
    },
    {
      code: "1010",
      name: "Checking Account",
      type: "asset",
      subType: "current_asset",
      isBankAccount: true,
      isSystem: false,
    },
    {
      code: "1020",
      name: "Savings Account",
      type: "asset",
      subType: "current_asset",
      isBankAccount: true,
      isSystem: false,
    },
    {
      code: "1200",
      name: "Accounts Receivable",
      type: "asset",
      subType: "current_asset",
      isControlAccount: true,
      isSystem: true,
    },
    {
      code: "1300",
      name: "Inventory",
      type: "asset",
      subType: "current_asset",
      isSystem: false,
    },
    {
      code: "1500",
      name: "Office Equipment",
      type: "asset",
      subType: "fixed_asset",
      isSystem: false,
    },
    {
      code: "1600",
      name: "Accumulated Depreciation",
      type: "asset",
      subType: "fixed_asset",
      isSystem: false,
    },

    // LIABILITIES (2000-2999)
    {
      code: "2000",
      name: "Accounts Payable",
      type: "liability",
      subType: "current_liability",
      isControlAccount: true,
      isSystem: true,
    },
    {
      code: "2100",
      name: "Sales Tax Payable",
      type: "liability",
      subType: "current_liability",
      isSystem: true,
    },
    {
      code: "2200",
      name: "Credit Card Payable",
      type: "liability",
      subType: "current_liability",
      isSystem: false,
    },
    {
      code: "2500",
      name: "Long-term Debt",
      type: "liability",
      subType: "long_term_liability",
      isSystem: false,
    },

    // EQUITY (3000-3999)
    {
      code: "3000",
      name: "Owner's Equity",
      type: "equity",
      isSystem: true,
    },
    {
      code: "3100",
      name: "Retained Earnings",
      type: "equity",
      isSystem: true,
    },
    {
      code: "3900",
      name: "Current Year Earnings",
      type: "equity",
      isSystem: true,
    },

    // REVENUE (4000-4999)
    {
      code: "4000",
      name: "Sales Revenue",
      type: "revenue",
      isSystem: true,
    },
    {
      code: "4100",
      name: "Service Revenue",
      type: "revenue",
      isSystem: false,
    },
    {
      code: "4200",
      name: "Other Income",
      type: "revenue",
      isSystem: false,
    },

    // EXPENSES (5000-9999)
    {
      code: "5000",
      name: "Cost of Goods Sold",
      type: "expense",
      isSystem: false,
    },
    {
      code: "6000",
      name: "Operating Expenses",
      type: "expense",
      isSystem: true,
    },
    {
      code: "6100",
      name: "Salaries and Wages",
      type: "expense",
      isSystem: false,
    },
    {
      code: "6200",
      name: "Rent Expense",
      type: "expense",
      isSystem: false,
    },
    {
      code: "6300",
      name: "Utilities",
      type: "expense",
      isSystem: false,
    },
    {
      code: "6400",
      name: "Office Supplies",
      type: "expense",
      isSystem: false,
    },
    {
      code: "6500",
      name: "Travel and Meals",
      type: "expense",
      isSystem: false,
    },
    {
      code: "6600",
      name: "Software and Subscriptions",
      type: "expense",
      isSystem: false,
    },
    {
      code: "6700",
      name: "Marketing and Advertising",
      type: "expense",
      isSystem: false,
    },
    {
      code: "6800",
      name: "Professional Fees",
      type: "expense",
      isSystem: false,
    },
    {
      code: "6900",
      name: "Insurance",
      type: "expense",
      isSystem: false,
    },
    {
      code: "7000",
      name: "Depreciation Expense",
      type: "expense",
      isSystem: false,
    },
  ];

  for (const accountData of accountsData) {
    await prisma.account.upsert({
      where: {
        companyId_code: {
          companyId: company.id,
          code: accountData.code,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        ...accountData,
        currentBalance: 0,
        currency: "USD",
      },
    });
  }

  console.log(`✅ Created ${accountsData.length} accounts\n`);

  // ==============================================
  // 3. CREATE SAMPLE CUSTOMERS
  // ==============================================
  console.log("👥 Creating sample customers...");

  const customers = [
    {
      name: "Tech Innovations Inc",
      email: "billing@techinnovations.com",
      phone: "+1 (555) 123-4567",
      type: "customer",
      address: {
        street: "123 Innovation Drive",
        city: "San Francisco",
        state: "CA",
        postalCode: "94102",
        country: "US",
      },
      paymentTermsDays: 30,
    },
    {
      name: "Global Services LLC",
      email: "accounts@globalservices.com",
      phone: "+1 (555) 234-5678",
      type: "customer",
      address: {
        street: "456 Business Blvd",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
      },
      paymentTermsDays: 15,
    },
    {
      name: "Creative Studios",
      email: "finance@creativestudios.com",
      phone: "+1 (555) 345-6789",
      type: "customer",
      address: {
        street: "789 Creative Way",
        city: "Los Angeles",
        state: "CA",
        postalCode: "90001",
        country: "US",
      },
      paymentTermsDays: 45,
    },
  ];

  for (const customerData of customers) {
    await prisma.contact.upsert({
      where: {
        id: `customer-${customerData.email}`,
      },
      update: {},
      create: {
        id: `customer-${customerData.email}`,
        companyId: company.id,
        ...customerData,
      },
    });
  }

  console.log(`✅ Created ${customers.length} customers\n`);

  // ==============================================
  // 4. CREATE SAMPLE SUPPLIERS
  // ==============================================
  console.log("🏪 Creating sample suppliers...");

  const suppliers = [
    {
      name: "Office Supplies Co",
      email: "sales@officesupplies.com",
      phone: "+1 (555) 456-7890",
      type: "supplier",
      address: {
        street: "321 Supply Street",
        city: "Chicago",
        state: "IL",
        postalCode: "60601",
        country: "US",
      },
    },
    {
      name: "Cloud Services Inc",
      email: "billing@cloudservices.com",
      phone: "+1 (555) 567-8901",
      type: "supplier",
      address: {
        street: "654 Tech Park",
        city: "Seattle",
        state: "WA",
        postalCode: "98101",
        country: "US",
      },
    },
  ];

  for (const supplierData of suppliers) {
    await prisma.contact.upsert({
      where: {
        id: `supplier-${supplierData.email}`,
      },
      update: {},
      create: {
        id: `supplier-${supplierData.email}`,
        companyId: company.id,
        ...supplierData,
      },
    });
  }

  console.log(`✅ Created ${suppliers.length} suppliers\n`);

  console.log("🎉 Seeding complete!\n");
  console.log("========================================");
  console.log("Demo Company Details:");
  console.log(`  ID: ${company.id}`);
  console.log(`  Name: ${company.name}`);
  console.log(`  Currency: ${company.currency}`);
  console.log(`  Accounts: ${accountsData.length}`);
  console.log(`  Customers: ${customers.length}`);
  console.log(`  Suppliers: ${suppliers.length}`);
  console.log("========================================\n");
  console.log("⚠️  Next Steps:");
  console.log("1. Create a user in Clerk (sign up at http://localhost:3000)");
  console.log("2. Add user to database with Prisma Studio (npm run db:studio)");
  console.log("3. Link user to company via CompanyUser table\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
