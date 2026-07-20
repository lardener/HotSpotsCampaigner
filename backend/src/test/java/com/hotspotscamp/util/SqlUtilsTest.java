/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package com.hotspotscamp.util;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.r2dbc.core.DatabaseClient;

class SqlUtilsTest {

    @Test
    void bindUuid_withValue_bindsStringForm() {
        DatabaseClient.GenericExecuteSpec spec = mock(DatabaseClient.GenericExecuteSpec.class);
        when(spec.bind(any(), any())).thenReturn(spec);
        UUID id = UUID.randomUUID();
        DatabaseClient.GenericExecuteSpec result = SqlUtils.bindUuid(spec, "cmdId", id);

        assertEquals(spec, result);
        verify(spec).bind("cmdId", id.toString());
    }

    @Test
    void bindUuid_withNull_bindsNullAsString() {
        DatabaseClient.GenericExecuteSpec spec = mock(DatabaseClient.GenericExecuteSpec.class);
        when(spec.bindNull(any(), any())).thenReturn(spec);
        SqlUtils.bindUuid(spec, "cmdId", null);

        verify(spec).bindNull("cmdId", String.class);
    }

    @Test
    void bindString_withValue_bindsValue() {
        DatabaseClient.GenericExecuteSpec spec = mock(DatabaseClient.GenericExecuteSpec.class);
        when(spec.bind(any(), any())).thenReturn(spec);
        SqlUtils.bindString(spec, "name", "Rogue");

        verify(spec).bind("name", "Rogue");
    }

    @Test
    void bindString_withNull_bindsNullAsString() {
        DatabaseClient.GenericExecuteSpec spec = mock(DatabaseClient.GenericExecuteSpec.class);
        when(spec.bindNull(any(), any())).thenReturn(spec);
        SqlUtils.bindString(spec, "name", null);

        verify(spec).bindNull("name", String.class);
    }

    @Test
    void bindDateTime_withValue_bindsValue() {
        DatabaseClient.GenericExecuteSpec spec = mock(DatabaseClient.GenericExecuteSpec.class);
        when(spec.bind(any(), any())).thenReturn(spec);
        LocalDateTime now = LocalDateTime.of(2026, 7, 18, 12, 0);
        SqlUtils.bindDateTime(spec, "ts", now);

        verify(spec).bind("ts", now);
    }

    @Test
    void bindDateTime_withNull_bindsNullAsDateTime() {
        DatabaseClient.GenericExecuteSpec spec = mock(DatabaseClient.GenericExecuteSpec.class);
        when(spec.bindNull(any(), any())).thenReturn(spec);
        SqlUtils.bindDateTime(spec, "ts", null);

        verify(spec).bindNull("ts", LocalDateTime.class);
    }
}
