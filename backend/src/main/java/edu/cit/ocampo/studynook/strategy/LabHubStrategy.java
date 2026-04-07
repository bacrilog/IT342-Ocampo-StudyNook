package edu.cit.ocampo.studynook.strategy;

import edu.cit.ocampo.studynook.entity.Reservation;
import edu.cit.ocampo.studynook.entity.Room;

public class LabHubStrategy implements BookingStrategy {

    @Override
    public boolean canBook(Room room, Reservation reservation) {
        // Multiple students up to capacity
        return room.getCurrentReservations() < room.getCapacity();
    }
}