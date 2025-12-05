package com.example.jtracker.wishlist;

import com.example.jtracker.user.User;
import com.example.jtracker.user.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

record WishlistItemDto(Long id, String company, String url, LocalDateTime createdAt) {}
record CreateWishlistReq(String company, String url) {}

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlist;
    private final UserRepository users;

    public WishlistController(WishlistRepository w, UserRepository u) {
        this.wishlist = w;
        this.users = u;
    }

    private User me() {
        var email = SecurityContextHolder.getContext().getAuthentication().getName();
        return users.findByEmail(email).orElseThrow();
    }

    @GetMapping
    public List<WishlistItemDto> list() {
        var owner = me();
        return wishlist.findByOwnerOrderByCreatedAtDesc(owner).stream()
                .map(it -> new WishlistItemDto(it.getId(), it.getCompany(), it.getUrl(), it.getCreatedAt()))
                .toList();
    }

    @PostMapping
    public WishlistItemDto create(@RequestBody CreateWishlistReq req) {
        var owner = me();
        var item = new WishlistItem();
        item.setOwner(owner);
        item.setCompany(req.company());
        item.setUrl(req.url());
        item.setCreatedAt(LocalDateTime.now());
        var saved = wishlist.save(item);
        return new WishlistItemDto(saved.getId(), saved.getCompany(), saved.getUrl(), saved.getCreatedAt());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        var owner = me();
        var item = wishlist.findById(id).orElseThrow();
        if (!item.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Forbidden");
        }
        wishlist.delete(item);
    }
}
