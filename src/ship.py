from board import board_size  # Import board_size from the board module.

def place_ship(board, ship_size, ship_id, ship_positions):
    while True:  # Loop until a valid ship placement is made.
        try:
            # Ask the user for the ship's orientation (Horizontal or Vertical) and convert it to uppercase.
            orientation = input(f"Enter orientation for ship of size {ship_size} (H for horizontal, V for vertical): ").upper()
            
            # Check if the input orientation is valid (either 'H' or 'V').
            if orientation not in ['H', 'V']:
                print("Invalid orientation. Please enter H or V.")  # Inform the user of invalid input.
                continue  # Restart the loop if invalid orientation is provided.
            
            # Get the starting row and column from the user.
            start_row = int(input("Enter starting row (0-9): "))
            start_col = int(input("Enter starting column (0-9): "))
            
            # Check if the starting position is within the bounds of the board.
            if not (0 <= start_row < board_size and 0 <= start_col < board_size):
                print("Invalid starting position. Please enter coordinates within the board.")  # Inform the user of out-of-bound coordinates.
                continue  # Restart the loop if invalid coordinates are provided.

            # If the ship is placed horizontally.
            if orientation == 'H':
                # Check if the ship fits within the board horizontally.
                if start_col + ship_size > board_size:
                    print("Ship does not fit horizontally. Try again.")  # Inform the user that the ship exceeds the board boundary.
                    continue  # Restart the loop.

                # Check if the ship overlaps with any existing ships.
                if any(board[start_row][start_col + i] != "~" for i in range(ship_size)):
                    print("Ship overlaps with another ship. Try again.")  # Inform the user of overlap with another ship.
                    continue  # Restart the loop.

                # Place the ship on the board by updating the grid with 'S' for each position.
                for i in range(ship_size):
                    board[start_row][start_col + i] = "S"  # Mark the ship's position on the board.
                    ship_positions[(start_row, start_col + i)] = ship_id  # Store the ship's position in ship_positions.
                break  # Exit the loop once the ship is successfully placed.

            # If the ship is placed vertically.
            elif orientation == 'V':
                # Check if the ship fits within the board vertically.
                if start_row + ship_size > board_size:
                    print("Ship does not fit vertically. Try again.")  # Inform the user that the ship exceeds the board boundary.
                    continue  # Restart the loop.

                # Check if the ship overlaps with any existing ships.
                if any(board[start_row + i][start_col] != "~" for i in range(ship_size)):
                    print("Ship overlaps with another ship. Try again.")  # Inform the user of overlap with another ship.
                    continue  # Restart the loop.

                # Place the ship on the board by updating the grid with 'S' for each position.
                for i in range(ship_size):
                    board[start_row + i][start_col] = "S"  # Mark the ship's position on the board.
                    ship_positions[(start_row + i, start_col)] = ship_id  # Store the ship's position in ship_positions.
                break  # Exit the loop once the ship is successfully placed.
        except ValueError:
            print("Please enter valid numbers.")  # Inform the user if they input non-numeric values.

def make_guess(board, row, col, ship_positions, ship_segments):
    # If the guessed position contains part of a ship.
    if board[row][col] == "S":
        board[row][col] = "X"  # Mark the position as a hit.
        ship_id = ship_positions.get((row, col))  # Retrieve the ship_id for the hit position.
        if ship_id is not None:
            ship_segments[ship_id].remove((row, col))  # Remove the hit segment from the ship's segment list.
            # If all segments of the ship are hit, the ship is sunk.
            if not ship_segments[ship_id]:
                print(f"Ship {ship_id} has been sunk!")  # Announce that the ship has been sunk.
        return "Hit!", True  # Return the result of the guess as a hit and indicate the guess was valid.

    # If the guessed position contains water.
    elif board[row][col] == "~":
        board[row][col] = "O"  # Mark the position as a miss.
        return "Miss!", True  # Return the result of the guess as a miss and indicate the guess was valid.

    # If the guessed position has already been guessed.
    else:
        return "Already guessed!", False  # Return the result as already guessed and indicate the guess was invalid.

def all_ships_sunk(ship_segments):
    # Check if all ships have been sunk by verifying that all ship segments are empty.
    return all(not segments for segments in ship_segments.values())  # Return True if all ships are sunk, False otherwise.
