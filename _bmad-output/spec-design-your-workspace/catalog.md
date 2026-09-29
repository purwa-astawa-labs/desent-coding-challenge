# Catalog

Seed catalog, shipped as static data. Every item carries a name, its own image asset, and a weekly rental price (USD, sample values). Images start as placeholders and are replaced by the owner's own files at the same paths.

| Category | Selection rule | Items (weekly price) |
|---|---|---|
| Desk | exactly one | Minimal White Desk ($30), Oak Standing Desk ($45), Walnut Executive Desk ($55) |
| Chair | exactly one | Lounge Task Chair ($20), Ergo Mesh Chair ($25), Executive Leather Chair ($35), Gaming Chair ($30) |
| Monitors | 0–3; same model may repeat | 24" Full HD Monitor ($12), 27" 4K Monitor ($20) |
| Desk accessories (workspace scene) | zero or more, one of each | Plants ($5), Desk Lamp ($6), Headphones ($8) |
| Lounge zone (own scene) | zero or more, one of each | Sofa ($35), Bean Bag ($12), Floor Plant ($7), Coffee Station ($15) |
| Garage (own scene) | zero or more, one of each; gear requires Garage Space | Garage Space ($40), Motorbike ($60), Surfboard ($12), Sport Gear ($10) |

Only compatibility rule: garage gear requires the Garage Space (adding gear adds it; removing it removes the gear). The monitor cap of 3 gives the layered preview fixed slots.
