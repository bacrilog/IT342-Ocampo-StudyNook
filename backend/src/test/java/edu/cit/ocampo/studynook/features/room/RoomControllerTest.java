package edu.cit.ocampo.studynook.features.room;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(RoomController.class)
@AutoConfigureMockMvc(addFilters = false)
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RoomService roomService;

    @Test
    void getAllRoomsShouldReturn200() throws Exception {
        Room room = new Room();
        room.setId(1L);
        room.setName("Discussion Room 1");
        room.setType("Discussion Room");
        room.setCapacity(5);
        room.setStatus("Available");

        when(roomService.getAllRooms()).thenReturn(List.of(room));

        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Discussion Room 1"));
    }

    @Test
    void createRoomShouldReturn400ForInvalidType() throws Exception {
        Room request = new Room();
        request.setType("Audio Booth");

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid room type"));
    }

    @Test
    void createRoomShouldAutogenerateNameAndCapacity() throws Exception {
        Room existing = new Room();
        existing.setName("Discussion Room 2");
        existing.setType("Discussion Room");

        when(roomService.getAllRooms()).thenReturn(List.of(existing));
        when(roomService.saveRoom(any(Room.class))).thenAnswer(invocation -> {
            Room toSave = invocation.getArgument(0);
            toSave.setId(3L);
            return toSave;
        });

        Room request = new Room();
        request.setType("Discussion Room");

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Discussion Room 3"))
                .andExpect(jsonPath("$.capacity").value(5));
    }
}
