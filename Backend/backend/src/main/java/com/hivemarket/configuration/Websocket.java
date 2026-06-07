package com.hivemarket.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class Websocket implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

    	registry.addEndpoint("/ws")
	    	.setHandshakeHandler(
	    	new UserHandshakeHandler()
	    	)
	    	.setAllowedOriginPatterns("*")
	    	.withSockJS();

    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // messages sent FROM client TO server
        registry.setApplicationDestinationPrefixes("/app");

        // messages sent FROM server TO clients
        registry.enableSimpleBroker(
                "/hivemarket-topic",
                "/hivemarket-queue"
        );

        // IMPORTANT: correct user destination handling
        registry.setUserDestinationPrefix("/user");
    }
}