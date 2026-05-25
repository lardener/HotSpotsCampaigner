package com.hotspotscamp.entity;

import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Maps a detachment to a specific contract for a specific month.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("detachment_contract_assignments")
public class ContractAssignment implements Persistable<UUID> {

    @Id
    private UUID id;

    @Column("detachment_id")
    private UUID detachmentId;

    @Column("contract_id")
    private UUID contractId;

    @Column("month_index")
    private Integer monthIndex;

    @Transient
    @Builder.Default
    @JsonIgnore
    private boolean isNew = true;

    @Override
    @JsonIgnore
    public boolean isNew() {
        return isNew || id == null;
    }

    public void setNew(boolean isNew) {
        this.isNew = isNew;
    }
}
