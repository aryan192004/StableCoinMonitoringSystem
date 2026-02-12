-- CreateEnum
CREATE TYPE "StablecoinType" AS ENUM ('FIAT_BACKED', 'CRYPTO_BACKED', 'ALGORITHMIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('PEG_DEVIATION', 'LIQUIDITY_DROP', 'VOLUME_SPIKE', 'MARKET_CAP_CHANGE', 'RESERVE_CHANGE');

-- CreateEnum
CREATE TYPE "AlertChannel" AS ENUM ('EMAIL', 'TELEGRAM', 'PUSH', 'WEBHOOK');

-- CreateTable
CREATE TABLE "stablecoins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "logo_url" TEXT,
    "website" TEXT,
    "whitepaper" TEXT,
    "blockchain" TEXT[],
    "issuer" TEXT NOT NULL,
    "type" "StablecoinType" NOT NULL,
    "launch_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stablecoins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_data" (
    "id" TEXT NOT NULL,
    "stablecoin_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "peg_deviation" DOUBLE PRECISION NOT NULL,
    "volume_24h" DOUBLE PRECISION NOT NULL,
    "volume_7d" DOUBLE PRECISION NOT NULL,
    "market_cap" DOUBLE PRECISION NOT NULL,
    "circulating_supply" DOUBLE PRECISION NOT NULL,
    "holders" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidity_metrics" (
    "id" TEXT NOT NULL,
    "stablecoin_id" TEXT NOT NULL,
    "total_liquidity" DOUBLE PRECISION NOT NULL,
    "order_book_depth_bids" DOUBLE PRECISION NOT NULL,
    "order_book_depth_asks" DOUBLE PRECISION NOT NULL,
    "bid_ask_spread" DOUBLE PRECISION NOT NULL,
    "dex_liquidity" DOUBLE PRECISION NOT NULL,
    "cex_liquidity" DOUBLE PRECISION NOT NULL,
    "liquidity_score" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "liquidity_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserves" (
    "id" TEXT NOT NULL,
    "stablecoin_id" TEXT NOT NULL,
    "cash" DOUBLE PRECISION NOT NULL,
    "treasury_bills" DOUBLE PRECISION NOT NULL,
    "commercial_paper" DOUBLE PRECISION NOT NULL,
    "corporate_bonds" DOUBLE PRECISION NOT NULL,
    "crypto_backed" DOUBLE PRECISION NOT NULL,
    "other" DOUBLE PRECISION NOT NULL,
    "total_reserves" DOUBLE PRECISION NOT NULL,
    "last_audited" TIMESTAMP(3) NOT NULL,
    "auditor" TEXT,
    "transparency_score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reserves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL,
    "stablecoin_id" TEXT NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "risk_level" TEXT NOT NULL,
    "peg_stability" DOUBLE PRECISION NOT NULL,
    "liquidity" DOUBLE PRECISION NOT NULL,
    "volume_volatility" DOUBLE PRECISION NOT NULL,
    "reserve_transparency" DOUBLE PRECISION NOT NULL,
    "warnings" TEXT[],
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stablecoin_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "channels" "AlertChannel"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_triggered" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stablecoins_symbol_key" ON "stablecoins"("symbol");

-- CreateIndex
CREATE INDEX "market_data_stablecoin_id_idx" ON "market_data"("stablecoin_id");

-- CreateIndex
CREATE INDEX "market_data_timestamp_idx" ON "market_data"("timestamp");

-- CreateIndex
CREATE INDEX "liquidity_metrics_stablecoin_id_idx" ON "liquidity_metrics"("stablecoin_id");

-- CreateIndex
CREATE INDEX "liquidity_metrics_timestamp_idx" ON "liquidity_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "reserves_stablecoin_id_idx" ON "reserves"("stablecoin_id");

-- CreateIndex
CREATE INDEX "risk_assessments_stablecoin_id_idx" ON "risk_assessments"("stablecoin_id");

-- CreateIndex
CREATE INDEX "risk_assessments_calculated_at_idx" ON "risk_assessments"("calculated_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "alerts_user_id_idx" ON "alerts"("user_id");

-- CreateIndex
CREATE INDEX "alerts_stablecoin_id_idx" ON "alerts"("stablecoin_id");

-- AddForeignKey
ALTER TABLE "market_data" ADD CONSTRAINT "market_data_stablecoin_id_fkey" FOREIGN KEY ("stablecoin_id") REFERENCES "stablecoins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidity_metrics" ADD CONSTRAINT "liquidity_metrics_stablecoin_id_fkey" FOREIGN KEY ("stablecoin_id") REFERENCES "stablecoins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserves" ADD CONSTRAINT "reserves_stablecoin_id_fkey" FOREIGN KEY ("stablecoin_id") REFERENCES "stablecoins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_stablecoin_id_fkey" FOREIGN KEY ("stablecoin_id") REFERENCES "stablecoins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_stablecoin_id_fkey" FOREIGN KEY ("stablecoin_id") REFERENCES "stablecoins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
