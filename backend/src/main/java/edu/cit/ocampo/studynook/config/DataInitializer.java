package edu.cit.ocampo.studynook.config;

import edu.cit.ocampo.studynook.entity.Room;
import edu.cit.ocampo.studynook.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedRooms(RoomRepository roomRepository) {
        return args -> {
            long count = roomRepository.count();

            if (count >= 4) {
                return;
            }

            if (count == 0) {
                Room discussionA = new Room();
                discussionA.setName("Discussion Room A");
                discussionA.setType("Discussion Room");
                discussionA.setCapacity(5);
                discussionA.setStatus("Available");

                Room discussionB = new Room();
                discussionB.setName("Discussion Room B");
                discussionB.setType("Discussion Room");
                discussionB.setCapacity(5);
                discussionB.setStatus("Available");

                Room labHub1 = new Room();
                labHub1.setName("Laboratory Hub 1");
                labHub1.setType("Laboratory Hub");
                labHub1.setCapacity(4);
                labHub1.setStatus("Available");

                Room labHub2 = new Room();
                labHub2.setName("Laboratory Hub 3");
                labHub2.setType("Laboratory Hub");
                labHub2.setCapacity(4);
                labHub2.setStatus("Available");

                roomRepository.save(discussionA);
                roomRepository.save(discussionB);
                roomRepository.save(labHub1);
                roomRepository.save(labHub2);
                return;
            }

            while (roomRepository.count() < 4) {
                Room extra = new Room();
                extra.setName("Discussion Room " + roomRepository.count());
                extra.setType("Discussion Room");
                extra.setCapacity(5);
                extra.setStatus("Available");
                roomRepository.save(extra);
            }
        };
    }
}
