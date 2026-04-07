package edu.cit.ocampo.studynook.strategy;

import edu.cit.ocampo.studynook.entity.Reservation;
import edu.cit.ocampo.studynook.entity.Room;

public class DefaultBookingStrategy implements BookingStrategy {

    @Override
    public boolean canBook(Room room, Reservation reservation) {
        // fallback: only allow if room is available
        return room.getStatus().equals("Available");
    }
}