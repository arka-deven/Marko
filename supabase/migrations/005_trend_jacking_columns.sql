-- Add trend-jacking columns to ideas table
-- Supports the trend-reactive idea generation feature where ideas
-- bridge current market trends to Cialdini book quotes.

ALTER TABLE ideas ADD COLUMN IF NOT EXISTS trend_reactive boolean DEFAULT false;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS trend_topic text;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS cialdini_bridge_quote text;
