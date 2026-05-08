package edu.cit.ocampo.studynook.features.reservation;

import edu.cit.ocampo.studynook.features.room.Room;

public class DiscussionRoomStrategy implements BookingStrategy {

    @Override
    public boolean canBook(Room room, Reservation reservation) {
        // Only one booking per time slot
        return room.getStatus().equals("Available");
    }
}