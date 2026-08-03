-- Index for detachment_contract_overrides by detachment
CREATE INDEX idx_detachment_contract_overrides_detachment 
    ON detachment_contract_overrides (detachment_id);
