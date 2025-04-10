package com.mail.writer.app;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        // Build prompt
        String prompt = buildPrompt(emailRequest);

        // Craft request
        Map<String, Object> requestBody = Map.of("contents", new Object[] {
                Map.of("parts", new Object[] {
                        Map.of("text", prompt)
                })
        });

        // Do request and get response
        String response = webClient.post().uri(geminiApiUrl + geminiApiKey).header("Content-Type", "application/json").bodyValue(requestBody)
                .retrieve().bodyToMono(String.class).block();

        // Extract and return response
        return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {
        try {
            if (response == null || response.isEmpty()) {
                return "Error: Empty response from API.";
            }
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            JsonNode candidatesNode = rootNode.path("candidates");
            if (candidatesNode.isMissingNode() || !candidatesNode.isArray() || candidatesNode.size() == 0) {
                return "Error: No candidates found in API response.";
            }
            return candidatesNode.get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            return "Error processing request: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply for hte following email content. Please don't generate a subject line");
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Use a ").append(emailRequest.getTone()).append("tone");

        }
        prompt.append("\nOriginal email: \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}
