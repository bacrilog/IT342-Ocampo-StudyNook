package edu.cit.ocampo.studynook.features.reservation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import edu.cit.ocampo.studynook.features.room.Room;
import edu.cit.ocampo.studynook.features.room.RoomService;

@WebMvcTest(ReservationController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReservationService reservationService;

    @MockBean
    private RoomService roomService;

    @MockBean
    private ReservationRepository reservationRepository;

    @Test
    void createReservationShouldReturn400WhenUserEmailMissing() throws Exception {
        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roomId\":\"1\",\"startTime\":\"2026-05-10T07:30:00\",\"endTime\":\"2026-05-10T09:30:00\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("User email is required"));
    }

    @Test
    void createReservationShouldReturn201ForValidPayload() throws Exception {
        Room room = new Room();
        room.setId(1L);
        room.setName("Discussion Room 1");
        room.setType("Discussion Room");
        room.setStatus("Available");

        when(roomService.getRoomById(1L)).thenReturn(Optional.of(room));
        when(reservationService.createReservation(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation reservation = invocation.getArgument(0);
            reservation.setId(5L);
            reservation.setStartTime(LocalDateTime.parse("2026-05-10T07:30:00"));
            reservation.setEndTime(LocalDateTime.parse("2026-05-10T09:30:00"));
            reservation.setStatus("Booked");
            return reservation;
        });

        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userEmail\":\"student@cit.edu\",\"roomId\":\"1\",\"startTime\":\"2026-05-10T07:30:00\",\"endTime\":\"2026-05-10T09:30:00\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.userEmail").value("student@cit.edu"));
    }
}
