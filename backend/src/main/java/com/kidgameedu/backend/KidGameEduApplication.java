package com.kidgameedu.backend;

import java.io.File;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KidGameEduApplication {

    public static void main(String[] args) {
        loadLocalEnvironment();
        SpringApplication.run(KidGameEduApplication.class, args);
    }

    private static void loadLocalEnvironment() {
        String dotenvDirectory = new File(".env").isFile()
            ? "."
            : new File("backend/.env").isFile() ? "backend" : ".";
        Dotenv dotenv = Dotenv.configure()
            .directory(dotenvDirectory)
                .ignoreIfMissing()
                .ignoreIfMalformed()
                .load();

        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), System.getProperty(entry.getKey(), entry.getValue())));
    }
}