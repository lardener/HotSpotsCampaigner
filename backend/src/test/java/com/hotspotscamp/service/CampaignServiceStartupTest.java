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
package com.hotspotscamp.service;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.MockedConstruction;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ClassPathResource;

@ExtendWith(MockitoExtension.class)
class RuleConfigurationServiceStartupTest {

    @InjectMocks
    private RuleConfigurationService ruleConfigurationService;

    @Test
    void init_ShouldThrowIOException_WhenConfigurationFileIsMissing() {
        // Using MockedConstruction to intercept 'new ClassPathResource(...)' calls 
        // inside the private loadMapTyped/loadList methods.
        try (MockedConstruction<ClassPathResource> mocked = mockConstruction(ClassPathResource.class,
                (mock, context) -> {
                    // Force getInputStream to fail, simulating a missing file on the classpath
                    when(mock.getInputStream()).thenThrow(new IOException("Simulated missing resource"));
                })) {

            assertThrows(IOException.class, () -> ruleConfigurationService.init());
        }
    }
}
