# Equipment Tracker – PMC

A Responsive Equipment Hire Management Application

[Live projecct](https://sshang93.github.io/equipment-tracker-pmc/)

![Responsive design](assets/images/responsive-design.png)

1. Project Goals
---
## Primary Goal

*To build a responsive web application that allows construction supervisors to track hired equipment, calculate cost exposure, and maintain a clear operational record of active and archived assets.

## Secondary Goals

*Demonstrate clean JavaScript architecture

*Implement state-driven rendering

*Use LocalStorage for persistence

*Apply responsive design principles

*Validate logic using automated testing (Jest)

2.User Experience (UX)
---
Target Audience:

Site Supervisors, Project Managers, Small Construction Businesses

These users require:

Quick visibility of hired assets, Clear cost tracking, Mobile accessibility on site
---

## Wireframes

Desktop Wireframe ![Desktop Woreframe](assets/images/desktop-wireframe.png)

Tablet Wireframe ![Tablet Wireframe](assets/images/ipad-wireframe.png)

Mobile Wireframe ![Mobile Wireframe](assets/images/mobile-wireframe.png)

--- 

## User Stories

As a supervisor, I want to add hired equipment so that I can track what is currently on hire.

As a supervisor, I want to archive equipment when it is off-hired so that the active list remains accurate.

As a supervisor, I want to restore archived items if archived incorrectly.

As a supervisor, I want to delete incorrect entries.

Cost Tracking

As a project manager, I want to see real-time total hire cost so that I can monitor financial exposure.

As a manager, I want archived items to show start → end dates so that I can review hire duration.

### Accessibility & Responsiveness
As a user, I want the application to function on mobile, tablet and desktop devices.
---
3.Design
---
## Design Philosophy

The interface follows a SaaS-style layout:

* Card-based structure

* Clear visual separation between Active and Archived lists

* Strong typographic hierarchy

* Touch-friendly button sizing

* Minimal cognitive load

* Colour Scheme

* A green gradient background was selected to reflect construction and operational themes while maintaining high contrast for accessibility.

* Layout

* Flexbox used for alignment

* Grid used for form responsiveness

## Media queries applied for:

* 320px (small phones)  ![320px](assets/images/320-top.png) ![320](assets/images/320-middle.png) ![320](assets/images/320-bottom.png)

* 393px–430px (modern iPhones) ![425](assets/images/425-top.png) ![425](assets/images/425-middle.png) ![425](assets/images/425-bottom.png)

* 768px (tablet) ![768](assets/images/768-top.png) ![768](assets/images/768-bottom.png)

* 992px+ (desktop) ![desktop](assets/images/desktop-top.png) ![desktop](assets/images/desktop-bottom.png)

--- 
4. Technologies Used
---

HTML

CSS (Flexbox, Grid, Media Queries, Variables)

JavaScript (ES6)

Bootstrap (layout utilities)

Font Awesome (icons)

Jest (unit testing)

5. Features

## Implemented Features

Add equipment with validation

![Add Equipment](assets/images/equipment-added.png)
![Equipment added to list](assets/images/added-equipment-and-grouped.png)

Group equipment by site

![Grouped equipment by site](assets/images/added-equipment-and-grouped.png)

Archive equipment (auto records end date)

![Archived equipment](assets/images/archived-equipment.png)

Restore archived equipment

![restored equipment](assets/images/archived-to-active.png)
![restored confirmed](assets/images/archive-to-active-confirmed.png)

Delete equipment

![deleted equipment](assets/images/deleted-equipment.png)

Real-time total cost calculation

![total cost calculation](assets/images/added-equipment-and-grouped.png)

6. Testing

Jest testing

Manual testing is completed by developers themselves and used to explore the app by testing form inputs, checking UI responsiveness, and trying to break it with invalid inputs.
It’s used for catching usability issues and unexpected behaviour early on. Automated testing uses tools like Jest to run fast, repeatable checks on code. It’s ideal for validating core functions like calcHireCost(), calcTotal(), deleteEquipment(), and local storage logic. Manual testing finds problems, automated testing prevents them from coming back.

![Jest Testing](assets/images/jest-results.png)

Validation

Desktop
![Desktop Validation](assets/images/desktop-lighthouse-audit.png)

Mobile
![Mobile Validation](assets/images/mobile-lighthouse-audit.png)

Tested on:

Chrome ![chrome](assets/images/chrome-test.png)

Safari ![safari](assets/images/safari-test.png)

Firefox ![firefox](assets/images/firefox-test.png)

Mobile ![mobile](assets/images/320-top.png)

JS Lint ![JS Lint](assets/images/jsLint.png)

## State Management
---
All equipment data is stored in a central equipmentList array, which acts as the single source of truth for the application.
All UI rendering and cost calculations derive from this state, ensuring predictable and consistent behaviour.

This state-driven approach simplifies debugging, improves maintainability, and ensures that every UI update reflects the latest data.

### Separation of Concerns
--- 
The application architecture intentionally separates responsibilities:

Rendering logic is responsible only for updating the DOM.

Calculation logic handles cost computation and aggregation.

Storage logic manages interaction with LocalStorage.

Event handling logic manages user interactions through delegated listeners.

This separation reduces tight coupling between components and makes the codebase easier to extend and test.

### Event Delegation
---
Event delegation is used for dynamic list items (Archive, Restore, Delete buttons).

Rather than attaching individual listeners to each element, a single delegated listener handles interactions based on data-action attributes.

This approach:

Improves performance

Prevents duplicate event bindings

Keeps DOM manipulation clean

Supports dynamic rendering without re-binding events

### Mode-Based Rendering
---
A single rendering function handles both Active and Archived views using a mode parameter.

This design:

Eliminates duplicated rendering logic

Improves readability

Simplifies future feature expansion

Reduces maintenance complexity

### Scalability Considerations
---
Although the current implementation uses LocalStorage, storage access is abstracted through dedicated wrapper functions.

This allows:

Future replacement with a REST API

Migration to a database-backed solution

Integration with authentication

### Multi-user expansion
---
The current structure mirrors patterns commonly used in scalable front-end applications, providing a clear pathway to production-level architecture.

8. Deployment

The project is deployed via GitHub Pages by pushing the code to GitHub, enabling Pages in the repository settings, selecting the main branch root as the source, and accessing the generated GitHub Pages URL.

9. Reflection

This project demonstrates structured planning through user stories, state-driven UI rendering, real-world problem solving, responsive design implementation, automated logic testing, and forward-thinking architectural decisions.

It establishes a strong foundation for a scalable construction-focused SaaS application.
