package edu.cit.ocampo.studynook.facade;

import org.springframework.stereotype.Component;

import edu.cit.ocampo.studynook.entity.Reservation;
import edu.cit.ocampo.studynook.entity.Room;
import edu.cit.ocampo.studynook.service.ReservationService;
import edu.cit.ocampo.studynook.service.RoomService;
import edu.cit.ocampo.studynook.strategy.BookingStrategy;
import edu.cit.ocampo.studynook.strategy.DefaultBookingStrategy;
import edu.cit.ocampo.studynook.strategy.DiscussionRoomStrategy;
import edu.cit.ocampo.studynook.strategy.LabHubStrategy;

@Component
public class BookingFacade {

    private final RoomService roomService;
    private final ReservationService reservationService;

    public BookingFacade(RoomService roomService, ReservationService reservationService) {
        this.roomService = roomService;
        this.reservationService = reservationService;
    }

    public boolean bookRoom(Room room, Reservation reservation) {
        BookingStrategy strategy;

        switch (room.getType()) {
            case "Discussion Room":
                strategy = new DiscussionRoomStrategy();
                break;
            case "Laboratory Hub":
                strategy = new LabHubStrategy();
                break;
            default:
                strategy = new DefaultBookingStrategy();
        }

        if (strategy.canBook(room, reservation)) {
            reservationService.saveReservation(reservation);
            return true;
        }
        return false;
    }
}