# Scaling

SparkClub roadmap for larger installations.

## Scaling Pathways
1. **Migration to Postgres**: Replace SQLite with PostgreSQL for higher concurrency.
2. **Stateless Backend Nodes**: Since backend auth is stateless JWT, spin up multiple Express clusters behind a load balancer.
3. **Caching**: Integrate Redis to cache dashboard counters.
