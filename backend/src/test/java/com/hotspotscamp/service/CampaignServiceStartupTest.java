package com.hotspotscamp.service;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
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
