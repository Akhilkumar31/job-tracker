package com.example.jtracker.wishlist;

import com.example.jtracker.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByOwnerOrderByCreatedAtDesc(User owner);
    long countByOwner(User owner);
}
