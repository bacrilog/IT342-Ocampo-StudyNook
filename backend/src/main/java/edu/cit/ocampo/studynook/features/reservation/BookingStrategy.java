package edu.cit.ocampo.studynook.features.reservation;

import edu.cit.ocampo.studynook.features.room.Room;

public interface BookingStrategy {
    boolean canBook(Room room, Reservation reservation);
}