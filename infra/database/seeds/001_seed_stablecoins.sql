-- Seed data for major stablecoins

INSERT INTO stablecoins (id, name, symbol, issuer, type, blockchain, launch_date, is_active, created_at, updated_at)
VALUES
  ('usdt', 'Tether', 'USDT', 'Tether Limited', 'FIAT_BACKED', ARRAY['ethereum', 'tron', 'bsc', 'solana'], '2014-10-06', true, NOW(), NOW()),
  ('usdc', 'USD Coin', 'USDC', 'Circle', 'FIAT_BACKED', ARRAY['ethereum', 'solana', 'avalanche', 'polygon'], '2018-09-26', true, NOW(), NOW()),
  ('dai', 'Dai', 'DAI', 'MakerDAO', 'CRYPTO_BACKED', ARRAY['ethereum'], '2017-12-27', true, NOW(), NOW()),
  ('busd', 'Binance USD', 'BUSD', 'Paxos', 'FIAT_BACKED', ARRAY['ethereum', 'bsc'], '2019-09-05', true, NOW(), NOW()),
  ('frax', 'Frax', 'FRAX', 'Frax Finance', 'HYBRID', ARRAY['ethereum', 'avalanche', 'fantom'], '2020-12-21', true, NOW(), NOW());

-- Sample market data (current snapshot)
INSERT INTO market_data (id, stablecoin_id, price, peg_deviation, volume_24h, volume_7d, market_cap, circulating_supply, holders, timestamp)
VALUES
  (gen_random_uuid()::text, 'usdt', 1.0001, 0.01, 45000000000, 315000000000, 95000000000, 95000000000, 5000000, NOW()),
  (gen_random_uuid()::text, 'usdc', 0.9998, -0.02, 8000000000, 56000000000, 25000000000, 25000000000, 2500000, NOW()),
  (gen_random_uuid()::text, 'dai', 1.0003, 0.03, 500000000, 3500000000, 5000000000, 5000000000, 500000, NOW()),
  (gen_random_uuid()::text, 'busd', 0.9999, -0.01, 3000000000, 21000000000, 15000000000, 15000000000, 800000, NOW()),
  (gen_random_uuid()::text, 'frax', 1.0002, 0.02, 200000000, 1400000000, 1000000000, 1000000000, 100000, NOW());

-- Sample reserve data
INSERT INTO reserves (id, stablecoin_id, cash, treasury_bills, commercial_paper, corporate_bonds, crypto_backed, other, total_reserves, last_audited, auditor, transparency_score, created_at)
VALUES
  (gen_random_uuid()::text, 'usdt', 15.5, 65.2, 12.3, 5.0, 0.0, 2.0, 100.0, '2026-01-15', 'BDO Italia', 0.75, NOW()),
  (gen_random_uuid()::text, 'usdc', 100.0, 0.0, 0.0, 0.0, 0.0, 0.0, 100.0, '2026-02-01', 'Grant Thornton', 0.95, NOW()),
  (gen_random_uuid()::text, 'dai', 0.0, 0.0, 0.0, 0.0, 100.0, 0.0, 100.0, '2026-02-10', 'On-chain verification', 1.0, NOW());
