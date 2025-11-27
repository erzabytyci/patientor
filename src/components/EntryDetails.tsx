import { Box, Typography, List, ListItem } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import WorkIcon from "@mui/icons-material/Work";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { Entry, Diagnosis, HealthCheckRating } from "../types";

interface Props {
    entry: Entry;
    diagnoses: Diagnosis[];
}

const assertNever = (value: never): never => {
    throw new Error(`Unhandled entry type: ${JSON.stringify(value)}`);
};

const HealthCheckHeart = ({ rating }: { rating: HealthCheckRating }) => {
    let color = "";
    switch (rating) {
        case HealthCheckRating.Healthy:
            color = "green";
            break;
        case HealthCheckRating.LowRisk:
            color = "yellow";
            break;
        case HealthCheckRating.HighRisk:
            color = "orange";
            break;
        case HealthCheckRating.CriticalRisk:
            color = "red";
            break;
        default:
            break;
    }

    return <FavoriteIcon style={{ color }} />;
};

const EntryDetails = ({ entry, diagnoses }: Props) => {
    const getDiagnosis = (code: string): Diagnosis | undefined =>
        diagnoses.find(d => d.code === code);

    switch (entry.type) {
        case "Hospital":
            return (
                <Box mb={2} p={1} border={1} borderRadius={2}>
                    <Typography>
                        <strong>{entry.date}</strong> <LocalHospitalIcon />
                    </Typography>
                    <Typography>
                        <em>{entry.description}</em>
                    </Typography>

                    {entry.diagnosisCodes && (
                        <List dense>
                            {entry.diagnosisCodes.map(code => (
                                <ListItem
                                    key={code}
                                    sx={{ display: "list-item", py: 0 }}
                                >
                                    {code} {getDiagnosis(code)?.name}
                                </ListItem>
                            ))}
                        </List>
                    )}

                    <Typography variant="body2">
                        Discharge: {entry.discharge.date} – {entry.discharge.criteria}
                    </Typography>
                    <Typography variant="body2">diagnose by {entry.specialist}</Typography>
                </Box>
            );

        case "OccupationalHealthcare":
            return (
                <Box mb={2} p={1} border={1} borderRadius={2}>
                    <Typography>
                        <strong>{entry.date}</strong> <WorkIcon /> {entry.employerName}
                    </Typography>
                    <Typography>
                        <em>{entry.description}</em>
                    </Typography>

                    {entry.diagnosisCodes && (
                        <List dense>
                            {entry.diagnosisCodes.map(code => (
                                <ListItem
                                    key={code}
                                    sx={{ display: "list-item", py: 0 }}
                                >
                                    {code} {getDiagnosis(code)?.name}
                                </ListItem>
                            ))}
                        </List>
                    )}

                    {entry.sickLeave && (
                        <Typography variant="body2">
                            Sick leave: {entry.sickLeave.startDate} – {entry.sickLeave.endDate}
                        </Typography>
                    )}
                    <Typography variant="body2">diagnose by {entry.specialist}</Typography>
                </Box>
            );

        case "HealthCheck":
            return (
                <Box mb={2} p={1} border={1} borderRadius={2}>
                    <Typography>
                        <strong>{entry.date}</strong> <LocalHospitalIcon />
                    </Typography>
                    <Typography>
                        <em>{entry.description}</em>
                    </Typography>

                    {entry.diagnosisCodes && (
                        <List dense>
                            {entry.diagnosisCodes.map(code => (
                                <ListItem
                                    key={code}
                                    sx={{ display: "list-item", py: 0 }}
                                >
                                    {code} {getDiagnosis(code)?.name}
                                </ListItem>
                            ))}
                        </List>
                    )}

                    <HealthCheckHeart rating={entry.healthCheckRating} />
                    <Typography variant="body2">diagnose by {entry.specialist}</Typography>
                </Box>
            );

        default:
            return assertNever(entry);
    }
};

export default EntryDetails;
