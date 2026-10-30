/**
 * Scene exports — The cinematic 3D landing page now uses a single
 * centerpiece HolographicSphere that the camera orbits around,
 * instead of 4 separate fading scenes.
 *
 * This dramatically simplifies the scene graph and improves performance
 * while creating a more cohesive visual experience.
 */
export { default as HolographicSphere } from '../ThreeD/HolographicSphere'
