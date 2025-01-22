from faker import Faker
from core.models import db, User, Agent, MarketplaceListing
from core.gamification import create_default_achievements
import random

fake = Faker()

def seed_database():
    # Create test users
    users = [User(
        username=fake.user_name(),
        email=fake.email(),
        password_hash=fake.sha256(),
        credits=random.randint(100, 10000),
        role='developer' if i % 5 == 0 else 'user'
    ) for i in range(50)]

    db.session.bulk_save_objects(users)
    db.session.commit()

    # Create test agents
    agents = [Agent(
        name=f"Agent-{fake.color_name()}-{fake.random_number(digits=3)}",
        description=fake.text(),
        owner_id=random.choice(users).id,
        price=random.randint(100, 5000),
        code=f"// Auto-generated agent code\nfunction run() {{\n  return '{fake.sentence()}';}}",
        category=random.choice(['finance', 'health', 'entertainment', 'education']),
        api_endpoint=fake.url()
    ) for _ in range(200)]

    db.session.bulk_save_objects(agents)
    db.session.commit()

    # Create marketplace listings
    listings = [MarketplaceListing(
        agent_id=agent.id,
        price=agent.price * random.uniform(1.1, 3.0),
        listing_type=random.choice(['rent', 'sell']),
        terms=fake.paragraph()
    ) for agent in agents]

    db.session.bulk_save_objects(listings)
    db.session.commit()

    # Create achievements
    create_default_achievements()

    print("Database seeded with:\n"
          f"- {len(users)} users\n"
          f"- {len(agents)} agents\n"
          f"- {len(listings)} marketplace listings\n"
          "- Default achievement system")

if __name__ == '__main__':
    seed_database()
