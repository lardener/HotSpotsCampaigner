-- Index for detachment_contract_overrides by campaign
CREATE INDEX idx_detachment_contract_overrides_campaign 
    ON detachment_contract_overrides (campaign_id);
