package edu.cit.ocampo.studynook.strategy;

import edu.cit.ocampo.studynook.entity.Reservation;
import edu.cit.ocampo.studynook.entity.Room;

public class DiscussionRoomStrategy implements BookingStrategy {

    @Override
    public boolean canBook(Room room, Reservation reservation) {
        // Only one booking per time slot
        return room.getStatus().equals("Available");
    }
}