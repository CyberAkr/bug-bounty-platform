// backend/src/main/java/be/bugbounty/backend/controller/admin/AdminUserController.java
package be.bugbounty.backend.controller.admin;

import be.bugbounty.backend.dto.admin.AdminUserCreateRequestDTO;
import be.bugbounty.backend.model.User;
import be.bugbounty.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody be.bugbounty.backend.dto.admin.AdminUserUpdateRequestDTO dto) {
        try {
            return ResponseEntity.ok(userService.adminUpdateUser(id, dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ CREATE
    @PostMapping
    public ResponseEntity<?> create(@RequestBody @Valid AdminUserCreateRequestDTO dto) {
        try {
            User created = userService.adminCreateUser(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            userService.adminDeleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) { // FK empêchant la suppression
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}
