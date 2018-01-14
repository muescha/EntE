---
title: "Entwurf und Entwicklung eines E-Government-Systems zur Digitalisierung des Entschuldigungsverfahrens"
toc: true
output: pdf_document
---

# Vorwort
- Danksagungen

# Einleitung
## Bedeutung E-Government
- Historische Entwicklung

## Status Quo Entschuldigungsverfahren
- Skizzierung des aktuellen Ablaufs
- Pro & Con

## Vor- und Nachteile der Digitalisierung
Welche Probleme können durch Digitalisierung...

- ...behoben werden?
- ...entstehen?

# Hauptteil
## Datenschutz
- Was darf ich überhaupt speichern?
- Was muss beachtet werden (Deutsches Recht)

## Modellierung
### System
- Modellierung des [MERN](http://mern.io/)-Stacks
- API: Denormalisierte Daten
- Dependencies, benutzte Tools/Frameworks/Libraries
  - Was brauche ich wieso?
  - Wieso dieses Tool statt einem anderen?

### Datenbank
- Entity-Relationship-Diagramm
- Wieso ist sie so modelliert?
- Wahl SQL-/Document-DB

## Umsetzung
- Interessante Code-Teile erklärt
  - Hashing mit [bcrypt](https://de.wikipedia.org/wiki/Bcrypt)
  - API: DB-Anfragen, denormalisierte Daten
- Kurze Erläuterung der wichtigsten Frameworks:
  - React (Component-Basiertes UI-Framework für Single-Page Webapps)
  - Express (HTTP Framework im Backend)
  - Mongoose (Wrapper für MongoDB, bietet u.A. Client-Side Validation)

## Containerisierung
(Evtl im Appendix, je nach Länge des Rests)

- Kurze Erklärung Docker
- Erläuterung: Vorzüge Stateless Architecture
- Distributed Deployments mit Kubernetes
  - Erklärung des Konzepts: Redundanz und *Horizontal Scaling* statt *Monolithischem Vertical Scaling*
  - Darbietung am Beispiel in der T-Cloud

# Fazit

# Appendix
- Erläuterung Redux (One-Way Data Flow) und Vergleich zum traditionellen MVC-Ansatz