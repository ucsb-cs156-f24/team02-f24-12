package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.time.LocalDateTime;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = MenuItemReviewController.class)
@Import(TestConfig.class)
public class MenuItemReviewControllerTests extends ControllerTestCase {

    @MockBean
    MenuItemReviewRepository menuItemsReviewRepository;

    @MockBean
    UserRepository userRepository;

    // Authorization tests for /api/menuitemreview/all

    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
        mockMvc.perform(get("/api/menuitemreview/all"))
                .andExpect(status().is(403)); // logged out users can't get all
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_users_can_get_all() throws Exception {
        mockMvc.perform(get("/api/menuitemreview/all"))
                .andExpect(status().isOk()); // logged in users can get all
    }

    @Test
    public void logged_out_users_cannot_get_by_id() throws Exception {
        mockMvc.perform(get("/api/menuitemreview?id=7"))
                .andExpect(status().is(403)); // logged out users can't get by id
    }

    // Authorization tests for /api/menuitemreview/post

    @Test
    public void logged_out_users_cannot_post() throws Exception {
        mockMvc.perform(post("/api/menuitemreview/post"))
                .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_users_cannot_post() throws Exception {
        mockMvc.perform(post("/api/menuitemreview/post"))
                .andExpect(status().is(403));    
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void an_admin_user_can_post_a_new_menuitemreview() throws Exception {
        // arrange
        LocalDateTime ldt = LocalDateTime.parse("2023-10-29T12:00:00");
        MenuItemReview menuItemReview = MenuItemReview.builder()
                                        .itemId(1L)
                                        .reviewerEmail("s@mail.com")
                                        .stars(5)
                                        .dateReviewed(ldt)
                                        .comments("Awesome!")
                                        .build();

        when(menuItemsReviewRepository.save(any())).thenReturn(menuItemReview);

        // act
        MvcResult response = mockMvc.perform(
                        post("/api/menuitemreview/post?itemId=1&reviewerEmail=s@mail.com&stars=5&dateReviewed=2023-10-29T12:00:00&comments=Awesome!")
                                .with(csrf()))
                        .andExpect(status().isOk()).andReturn();

        // assert
        verify(menuItemsReviewRepository, times(1)).save(eq(menuItemReview));
        String expectedJson = mapper.writeValueAsString(menuItemReview);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }





    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_users_can_get_all_menuitemreview() throws Exception {
        // arrange
        LocalDateTime ldt1 = LocalDateTime.parse("2023-10-29T12:00:00");
        MenuItemReview review1 = MenuItemReview.builder()
                                        .itemId(1L)
                                        .reviewerEmail("j@mail.com")
                                        .stars(4)
                                        .dateReviewed(ldt1)
                                        .comments("Good item.")
                                        .build();

        LocalDateTime ldt2 = LocalDateTime.parse("2023-10-30T13:00:00");
        MenuItemReview review2 = MenuItemReview.builder()
                                        .itemId(2L)
                                        .reviewerEmail("e@mail.com")
                                        .stars(5)
                                        .dateReviewed(ldt2)
                                        .comments("Excellent!")
                                        .build();

        ArrayList<MenuItemReview> expectedReviews = new ArrayList<>();
        expectedReviews.addAll(Arrays.asList(review1, review2));

        when(menuItemsReviewRepository.findAll()).thenReturn(expectedReviews);

        // act
        MvcResult response = mockMvc.perform(get("/api/menuitemreview/all"))
                        .andExpect(status().isOk()).andReturn();

        // assert
        verify(menuItemsReviewRepository, times(1)).findAll();
        String expectedJson = mapper.writeValueAsString(expectedReviews);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = {"USER" })
    @Test
    public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
        // arrange
        LocalDateTime ldt = LocalDateTime.parse("2023-10-29T12:00:00");
        MenuItemReview review = MenuItemReview.builder()
                                    .itemId(1L)
                                    .reviewerEmail("user@mail.com")
                                    .stars(5)
                                    .dateReviewed(ldt)
                                    .comments("Awesome!")
                                    .build();

        when(menuItemsReviewRepository.findById(eq(7L))).thenReturn(Optional.of(review));

        // act
        MvcResult response = mockMvc.perform(get("/api/menuitemreview?id=7"))
                        .andExpect(status().isOk()).andReturn();

        // assert
        verify(menuItemsReviewRepository, times(1)).findById(eq(7L));
        String expectedJson = mapper.writeValueAsString(review);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {
        // arrange
        when(menuItemsReviewRepository.findById(eq(7L))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(get("/api/menuitemreview?id=7"))
                        .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(menuItemsReviewRepository, times(1)).findById(eq(7L));
        Map<String, Object> json = responseToJson(response);
        assertEquals("MenuItemReview with id 7 not found", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_can_delete_a_menuitemreview() throws Exception {
        // arrange
        LocalDateTime ldt = LocalDateTime.parse("2023-10-29T12:00:00");
        MenuItemReview review = MenuItemReview.builder()
                                    .id(15L)
                                    .itemId(1L)
                                    .reviewerEmail("admin@mail.com")
                                    .stars(5)
                                    .dateReviewed(ldt)
                                    .comments("Perfect!")
                                    .build();

        when(menuItemsReviewRepository.findById(eq(15L))).thenReturn(Optional.of(review));

        // act
        MvcResult response = mockMvc.perform(
                        delete("/api/menuitemreview?id=15")
                                .with(csrf()))
                        .andExpect(status().isOk()).andReturn();

        // assert
        verify(menuItemsReviewRepository, times(1)).findById(15L);
        verify(menuItemsReviewRepository, times(1)).delete(any());

        Map<String, Object> json = responseToJson(response);
        assertEquals("MenuItemReview with id 15 deleted", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_tries_to_delete_non_existant_menuitemreview_and_gets_right_error_message()
        throws Exception {
        // arrange
        when(menuItemsReviewRepository.findById(eq(15L))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(
                        delete("/api/menuitemreview?id=15")
                                .with(csrf()))
                        .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(menuItemsReviewRepository, times(1)).findById(15L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("MenuItemReview with id 15 not found", json.get("message"));
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_can_edit_an_existing_menuitemreview() throws Exception {
        // arrange
        LocalDateTime originalLdt = LocalDateTime.parse("2023-10-29T12:00:00");
        LocalDateTime editedLdt = LocalDateTime.parse("2024-01-01T00:00:00");

        MenuItemReview originalReview = MenuItemReview.builder()
                                        .id(526L)
                                        .itemId(1L)
                                        .reviewerEmail("original@mail.com")
                                        .stars(3)
                                        .dateReviewed(originalLdt)
                                        .comments("Average.")
                                        .build();

        MenuItemReview editedReview = MenuItemReview.builder()
                                        .id(526L)
                                        .itemId(2L)
                                        .reviewerEmail("edited@mail.com")
                                        .stars(4)
                                        .dateReviewed(editedLdt)
                                        .comments("Good.")
                                        .build();

        String requestBody = mapper.writeValueAsString(editedReview);

        when(menuItemsReviewRepository.findById(eq(526L))).thenReturn(Optional.of(originalReview));

        // act
        MvcResult response = mockMvc.perform(
                        put("/api/menuitemreview?id=526")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                        .andExpect(status().isOk()).andReturn();

        // assert
        verify(menuItemsReviewRepository, times(1)).findById(526L);
        verify(menuItemsReviewRepository, times(1)).save(editedReview);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(requestBody, responseString);
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_cannot_edit_menuitemreview_that_does_not_exist() throws Exception {
        // arrange
        LocalDateTime ldt = LocalDateTime.parse("2023-10-29T12:00:00");
        MenuItemReview editedReview = MenuItemReview.builder()
                                        .id(526L)
                                        .itemId(2L)
                                        .reviewerEmail("nonexistent@mail.com")
                                        .stars(2)
                                        .dateReviewed(ldt)
                                        .comments("Bad.")
                                        .build();

        String requestBody = mapper.writeValueAsString(editedReview);

        when(menuItemsReviewRepository.findById(eq(526L))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(
                        put("/api/menuitemreview?id=526")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                        .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(menuItemsReviewRepository, times(1)).findById(526L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("MenuItemReview with id 526 not found", json.get("message"));
    }
}