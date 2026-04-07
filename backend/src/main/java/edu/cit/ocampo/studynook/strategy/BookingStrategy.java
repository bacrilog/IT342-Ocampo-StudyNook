package edu.cit.ocampo.studynook.strategy;

import edu.cit.ocampo.studynook.entity.Reservation;
import edu.cit.ocampo.studynook.entity.Room;

public interface BookingStrategy {
    boolean canBook(Room room, Reservation reservation);
}