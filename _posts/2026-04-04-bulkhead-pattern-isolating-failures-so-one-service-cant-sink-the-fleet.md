---
title : "Bulkhead Pattern: Isolating Failures So One Service Can’t Sink the Fleet"
author : "merolhack"
date : "2026-04-04"
categories : 
 - patterns
tags : ""
---

Named after the compartments in a ship's hull, the bulkhead pattern isolates thread pools, connection pools, and resources per downstream dependency. This post shows how to apply it so a failing search service doesn't crash checkout.
