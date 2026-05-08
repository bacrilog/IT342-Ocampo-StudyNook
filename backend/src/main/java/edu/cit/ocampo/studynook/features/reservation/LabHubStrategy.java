package edu.cit.ocampo.studynook.features.reservation;

import edu.cit.ocampo.studynook.features.room.Room;

public class LabHubStrategy implements BookingStrategy {

    @Override
    public boolean canBook(Room room, Reservation reservation) {
        // Multiple students up to capacity
        return room.getCurrentReservations() < room.getCapacity();
    }
}