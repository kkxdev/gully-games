# Kanche: observations for the next milestone

These are architecture questions, not an implementation specification. Kanche is not implemented in this refactor.

- **Marble physics:** circular Matter bodies may provide useful rolling-like planar collision behavior. Explore friction, restitution, radius and edge/circle rules experimentally; Pen Fight's rectangular pen tuning should not dictate marble tuning.
- **Aiming/flicking:** dragging backward could be familiar, but interaction with a selected marble, shot limits and power tuning are Kanche decisions. Implement independently before comparing helpers.
- **Multiple marbles:** track marble identities, positions and eligibility in a Kanche-owned state/model, not a two-pen map. Separate simulation objects from React presentation state.
- **Turns:** decide which marble can be played, whether pocketing/knocking one out grants another turn, and which regional variation the prototype represents. Do not inherit Pen Fight phases or best-of-five matches.
- **Win conditions:** possibilities include collecting a target count, clearing a marked circle, or accuracy challenges. Choose one clear local rule set before implementation. Result scores can be present or absent.
- **Touch:** selection must be forgiving when marbles overlap; communicate the selected marble, valid target and cancellation. Validate on small screens with fingers.
- **Potential sharing:** runtime ownership, async cancellation, registry discovery, base state and Phaser lifecycle cleanup already belong to the platform. Aiming-vector math or gesture cancellation might become shared only after both implementations demonstrate the same requirements.
- **Keep local:** marble inventories, selection, circular playfield rules, CPU targeting, rewards, turn progression, visuals and HUD.

A typed Kanche definition should pair its lazy runtime with its own React presentation and register through the existing component-closure path. GameHost and Pen Fight should require no changes.

**Do not extract a shared FlickEngine yet.** Do not add backend, multiplayer, progression or a neighbourhood map to the next vertical slice without a concrete requirement.
