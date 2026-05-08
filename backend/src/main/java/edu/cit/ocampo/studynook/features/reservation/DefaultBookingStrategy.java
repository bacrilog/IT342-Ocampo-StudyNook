package edu.cit.ocampo.studynook.features.reservation;

import edu.cit.ocampo.studynook.features.room.Room;

public class DefaultBookingStrategy implements BookingStrategy {

    @Override
    public boolean canBook(Room room, Reservation reservation) {
        // fallback: only allow if room is available
        return room.getStatus().equals("Available");
    }
}