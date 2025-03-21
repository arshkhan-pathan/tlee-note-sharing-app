import typer
import asyncio
from getpass import getpass

from services.users_service import create_fixture_super_user

app = typer.Typer()


@app.command()
def create_super_user(name: str):
    """Greet a person by name."""
    typer.echo("Creating Super User")
    name = input("Name: ")
    email = input("Email: ")
    password = getpass("Password: ")
    password_confirm = getpass("Confirm Password: ")

    # Validate if passwords match
    if password != password_confirm:
        typer.echo("Passwords do not match. Please try again.")
        raise typer.Exit(code=1)

    asyncio.run(create_fixture_super_user(name, email, password))


if __name__ == "__main__":
    app()
