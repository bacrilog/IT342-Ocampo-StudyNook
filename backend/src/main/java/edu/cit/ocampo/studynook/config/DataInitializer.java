package edu.cit.ocampo.studynook.config;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import edu.cit.ocampo.studynook.entity.Room;
import edu.cit.ocampo.studynook.entity.User;
import edu.cit.ocampo.studynook.repository.RoomRepository;
import edu.cit.ocampo.studynook.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedRooms(
            RoomRepository roomRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Ensure default superuser credentials are always present.
            Optional<User> adminOpt = userRepository.findByEmail("admin@gmail.com");
            User admin = adminOpt.orElseGet(User::new);
            admin.setName("System Administrator");
            admin.setEmail("admin@gmail.com");
            admin.setRole("ADMIN");
            admin.setPasswordHash(passwordEncoder.encode("123456"));
            if (admin.getCreatedAt() == null) {
                admin.setCreatedAt(LocalDateTime.now());
            }
            userRepository.save(admin);

            // Seed default rooms once when the catalog is empty.
            if (roomRepository.count() > 0) {
                return;
            }

            // Create Laboratory Hubs 1-3
            for (int i = 1; i <= 3; i++) {
                Room room = new Room();
                room.setName("Laboratory Hub " + i);
                room.setType("Laboratory Hub");
                room.setCapacity(4);
                room.setStatus("Available");
                roomRepository.save(room);
            }

            // Create Discussion Rooms 1-3
            for (int i = 1; i <= 3; i++) {
                Room room = new Room();
                room.setName("Discussion Room " + i);
                room.setType("Discussion Room");
                room.setCapacity(5);
                room.setStatus("Available");
                roomRepository.save(room);
            }
        };
    }
}
