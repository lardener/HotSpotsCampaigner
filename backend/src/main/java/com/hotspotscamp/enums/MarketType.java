/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package com.hotspotscamp.enums;

/**
 * Market types for the campaign unit market. Each campaign has up to 3 market
 * slots plus a scrapper market.
 */
public enum MarketType {
    /**
     * Generic units available to all players, not tied to any employer
     */
    FREE,
    /**
     * Units offered by THE Primary Employer
     */
    PRIMARY_EMPLOYER,
    /**
     * Units offered by THE Opposition Employer
     */
    OPPOSITION_EMPLOYER,
    /**
     * Random-unit draw — a special section with a "pay X, get random" link
     */
    SCRAPPERS
}
