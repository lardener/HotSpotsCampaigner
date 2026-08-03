-- Index for detachment_contract_overrides by employer faction
CREATE INDEX idx_detachment_contract_overrides_employer 
    ON detachment_contract_overrides (employer_faction_id);
